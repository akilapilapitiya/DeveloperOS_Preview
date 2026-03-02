package devos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dedicated DTO for profile update requests.
 * Only contains fields the user is allowed to edit.
 * Mirrors the Organization update pattern.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDto {
    private String bio;
    private String company;
    private String location;
    private String websiteUrl;
    private String twitterUsername;
    private String phoneNumber;
    private String secondaryEmail;
}
