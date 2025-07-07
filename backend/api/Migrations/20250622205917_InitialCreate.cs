using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "243ff4dd-aed9-40f6-bba0-4549fcaac8c0");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "aee4ece3-545b-47e9-a14d-f8e97502d202");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "03594297-9359-4614-ad57-141535a328f5", null, "Admin", "ADMIN" },
                    { "e9831482-99eb-43ec-ac7d-40e0e0a7fc9e", null, "User", "USER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "03594297-9359-4614-ad57-141535a328f5");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e9831482-99eb-43ec-ac7d-40e0e0a7fc9e");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "243ff4dd-aed9-40f6-bba0-4549fcaac8c0", null, "User", "USER" },
                    { "aee4ece3-545b-47e9-a14d-f8e97502d202", null, "Admin", "ADMIN" }
                });
        }
    }
}
