namespace api_core.Models
{
    public class appModel
    {
        public class requestLogin
        {
            public string email { get; set; }
            public string password { get; set; }
        }

        public class responseGeneric
        {
            public bool status { get; set; }
            public string message { get; set; }
        }

        public class Users
        {
            public string Rut { get; set; }

            public string FirstName { get; set; }
            public string SecondName { get; set; }
            public string FirstSurname { get; set; }
            public string SecondSurname { get; set; }
            public DateTime Birthdate { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public string Address { get; set; }
            public string AddressVerificationUrl { get; set; }
            public string Cellphone { get; set; }
            public int IdTypeUser { get; set; }
        }


        public class requestReport
        {
            public int id_neighborhood_board { get; set; }
            public string rut { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public string image_path {  get; set; }  
        }

        public class requestReportFront
        {
            public int id_neighborhood_board { get; set; }
            public string rut { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public IFormFile image { get; set; }


        }
    }
}
