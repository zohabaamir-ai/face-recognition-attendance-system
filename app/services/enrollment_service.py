from PIL import Image

from app.models.face_model import FaceModel
from app.schemas.enrollment_schemas import EnrollmentResponse, EnrollmentError


class EnrollmentService:
    def __init__(self, face_model: FaceModel, student_repository):
        self.face_model = face_model
        self.student_repository = student_repository

    def enroll_student(self, name: str, roll_number: str, image: Image.Image) -> EnrollmentResponse:
        detected_faces = self.face_model.get_faces(image)

        if len(detected_faces) == 0:
            raise EnrollmentError("No face detected in the photo. Please upload a clear, front-facing photo.")
        if len(detected_faces) > 1:
            raise EnrollmentError(f"Found {len(detected_faces)} faces. Please upload a photo with only one person.")

        face = detected_faces[0]

        student = self.student_repository.create_student(
            name=name,
            roll_number=roll_number,
            embedding=face.embedding,
        )

        return EnrollmentResponse(
            student_id=student.id,
            name=student.name,
            message="Student enrolled successfully.",
        )

