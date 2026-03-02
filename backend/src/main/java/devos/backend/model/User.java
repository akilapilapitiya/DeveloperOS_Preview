package devos.backend.model;

import jakarta.persistence.*;
import devos.backend.util.EncryptionAttributeConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseModel {

    @Column(nullable = false, unique = true)
    private String keycloakId; // The 'sub' claim from JWT

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String username;

    private String firstName;
    private String lastName;

    // --- Enriched Profile Data ---
    @Column(columnDefinition = "TEXT")
    private String bio;
    private String company;
    private String location;
    private String websiteUrl;
    private String twitterUsername;
    private String phoneNumber;     // For future 2FA
    private String secondaryEmail;  // Alternative contact email
    // -----------------------------

    @Builder.Default
    private boolean active = true;

    private String githubUsername;
    private String githubAvatarUrl;
    private String avatarPath; // Custom uploaded avatar

    @Convert(converter = EncryptionAttributeConverter.class)
    @Column(columnDefinition = "TEXT")
    private String githubAccessToken;

    private java.time.LocalDateTime githubConnectedAt;
    private java.time.LocalDateTime githubTokenExpiresAt;
    
    @Column(columnDefinition = "TEXT")
    private String githubScopes;
}
