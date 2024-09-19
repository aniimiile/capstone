namespace api_core.Models
{
    public class faceValidationModel
    {
        public class requestFaceValidation
        {
            public string id_card_photo { get; set; }
            public string face_photo { get; set; }
        }

        public class responseFaceValidation
        {
            public bool status { get; set; }
            public string message { get; set; }
        }
    }
}
