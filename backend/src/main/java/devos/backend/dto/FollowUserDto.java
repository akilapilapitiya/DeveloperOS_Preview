package devos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowUserDto {
    private UUID id;
    private String githubUsername;
    private String firstName;
    private String lastName;
    private String avatarPath;
    private String githubAvatarUrl;
    private String bio;
}
