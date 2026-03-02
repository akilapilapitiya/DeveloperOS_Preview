package devos.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {
    private UUID id;
    private String keycloakId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private boolean active;
    
    // Profile Fields
    private String bio;
    private String company;
    private String location;
    private String websiteUrl;
    private String twitterUsername;
    private String phoneNumber;
    private String secondaryEmail;

    private String githubUsername;
    private String githubAvatarUrl;
    private String avatarPath; // Custom uploaded avatar
}
