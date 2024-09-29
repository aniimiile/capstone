using Dapper;
using Microsoft.AspNetCore.Identity.Data;
using System.Data;
using System.Diagnostics.Eventing.Reader;
using System.Net.Http;
using System.Net.NetworkInformation;
using static api_core.Models.appModel;
using static api_core.Models.faceValidationModel;

namespace api_core.Services
{
    public class appService
    {
        private readonly ILogger<faceValidationService> _logger;
        private readonly IDbConnection _dbConnection;

        public appService(ILogger<faceValidationService> logger, IDbConnection dbConnection)
        {
            _logger = logger;
            _dbConnection = dbConnection;
        }

        public async Task<responseGeneric> login(requestLogin request)
        {
            try
            {
                var sql = @"select * from users
                         where id_type_user = 3
                           and email = @email
                           and password = @password";

                var parameters = new { email = request.email, password = request.password };

                var response = await _dbConnection.QueryFirstOrDefaultAsync<Users>(sql, parameters);

                if (response == null)
                {
                    return new responseGeneric
                    {
                        status = false,
                        message = "login incorrecto"
                    };
                }

                return new responseGeneric
                {
                    status = true,
                    message = "login correcto"
                };
            } catch (Exception ex)
            {
                return new responseGeneric
                {
                    status = true,
                    message = $"An error occurred: {ex.Message}"
                };
            }

           

        }

        public async Task<responseGeneric> report(requestReport request)
        {
            try
            {

                var sql = @"insert into report (id_neighborhood_board, rut, title, description, image_path, id_status)
                            values (@id_neighborhood_board, @rut, @title, @description, @image_path, @id_status)";

                var parameters = new { 
                    id_neighborhood_board = request.id_neighborhood_board, 
                    rut = request.rut,
                    title = request.title,
                    description = request.description,
                    image_path = request.image_path,
                    id_status = 1
                };

                var rowsAffected = await _dbConnection.ExecuteAsync(sql, parameters);

                if (rowsAffected > 0)
                {
                    return new responseGeneric
                    {
                        status = true,
                        message = "reporte ingresado correctamente"
                    };
                } else
                {
                    return new responseGeneric
                    {
                        status = true,
                        message = "reporte no ingresado"
                    };
                }

            } catch (Exception ex)
            {
                return new responseGeneric
                {
                    status = true,
                    message = $"An error occurred: {ex.Message}"
                };
            }
        }

    }
}
