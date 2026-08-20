import torch

from PIL import Image

from app.models.face_model import FaceModel
from app.schemas.recognition_schemas import (
    RecognitionResult,
    RecognitionResponse,
)
from app.services.notification_service import (
    NotificationService,
)


RECOGNITION_THRESHOLD = 1.0


class RecognitionService:
    def __init__(
        self,
        face_model: FaceModel,
        student_repository,
        notification_service: NotificationService,
    ):
        self.face_model = face_model
        self.student_repository = student_repository
        self.notification_service = (
            notification_service
        )

    def _euclidean_distance(
        self,
        embedding_1,
        embedding_2,
    ) -> float:
        return (
            embedding_1 - embedding_2
        ).norm().item()

    def _find_best_match(
        self,
        face_embedding,
        students,
    ):
        best_distance = float("inf")
        best_student = None

        for student in students:
            stored_embedding = torch.tensor(
                student.embedding
            )

            distance = self._euclidean_distance(
                face_embedding,
                stored_embedding,
            )

            if distance < best_distance:
                best_distance = distance
                best_student = student

        return best_student, best_distance

    def recognize_faces(
        self,
        image: Image.Image,
    ) -> RecognitionResponse:

        detected_faces = (
            self.face_model.get_faces(image)
        )

        # No face detected
        if len(detected_faces) == 0:
            return RecognitionResponse(
                results=[]
            )

        # One-person-at-a-time entry
        if len(detected_faces) > 1:
            raise ValueError(
                "Multiple faces detected. "
                "Please ensure only one person "
                "is in front of the camera."
            )

        students = (
            self.student_repository
            .get_all_students()
        )

        # Exactly one face
        face = detected_faces[0]

        best_student, best_distance = (
            self._find_best_match(
                face.embedding,
                students,
            )
        )

        if (
            best_student is not None
            and best_distance
            <= RECOGNITION_THRESHOLD
        ):
            attendance_log = (
                self.student_repository
                .log_attendance(
                    student_id=best_student.id,
                    match_distance=best_distance,
                )
            )

            # Attendance was successfully recorded.
            self.notification_service.create_attendance_notification(
                student_id=best_student.id,
                student_name=best_student.name,
            )

            return RecognitionResponse(
                results=[
                    RecognitionResult(
                        student_id=best_student.id,
                        name=best_student.name,
                        distance=best_distance,
                        matched=True,
                        timestamp=attendance_log.timestamp,
                    )
                ]
            )

        # Face detected but no registered
        # student matched.
        return RecognitionResponse(
            results=[
                RecognitionResult(
                    student_id=None,
                    name=None,
                    distance=best_distance,
                    matched=False,
                    timestamp=None,
                )
            ]
        )