using api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
    {
        public ApplicationDBContext(DbContextOptions options) : base(options)
        {

        }
        public DbSet<Form> Forms { get; set; }
        public DbSet<FormField> FormFields { get; set; }
        public DbSet<FormFieldOption> FormFieldOptions { get; set; }
        public DbSet<FormResponse> FormResponses { get; set; }
        public DbSet<FieldResponse> FieldResponses { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // This line is important for Identity

            // Defining composite primary key for FieldResponse
            //modelBuilder.Entity<FieldResponse>()
            //    .HasKey(fr => new { fr.ResponseId, fr.FieldId });

            // Defining relationships
            modelBuilder.Entity<Form>()
                .HasOne(f => f.User)
                .WithMany(u => u.Forms)
                .HasForeignKey(f => f.UserId);

            modelBuilder.Entity<FormField>()
                .HasOne(ff => ff.Form)
                .WithMany(f => f.FormFields)
                .HasForeignKey(ff => ff.FormId);

            modelBuilder.Entity<FormResponse>()
                .HasOne(fr => fr.Form)
                .WithMany(f => f.FormResponses)
                .HasForeignKey(fr => fr.FormId);

            modelBuilder.Entity<FormResponse>()
                .HasOne(fr => fr.User)
                .WithMany(u => u.FormResponses)
                .HasForeignKey(fr => fr.UserId)
                .IsRequired(false);

            modelBuilder.Entity<FieldResponse>()
                .HasOne(fr => fr.FormResponse)
                .WithMany(fr => fr.FieldResponses)
                .HasForeignKey(fr => fr.ResponseId)
                .OnDelete(DeleteBehavior.Restrict);  // Avoid cascading delete issues

            modelBuilder.Entity<FieldResponse>()
                .HasOne(fr => fr.FormField)
                .WithMany(ff => ff.FieldResponses)
                .HasForeignKey(fr => fr.FieldId)
                .OnDelete(DeleteBehavior.Cascade);  // Avoid cascading delete issues

            modelBuilder.Entity<FormFieldOption>()
                .HasOne(fo => fo.FormField)
                .WithMany(f => f.FormFieldOptions)
                .HasForeignKey(fo => fo.FieldId);

            // Seed roles
            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole { Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole { Name = "User", NormalizedName = "USER" }
            };
            modelBuilder.Entity<IdentityRole>().HasData(roles);

        }


    }


}
