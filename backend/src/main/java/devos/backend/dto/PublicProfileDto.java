package devos.backend.dto;

import devos.backend.model.Skill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Public profile DTO returned by GET /api/v1/profile/u/{username}.
 * Contains everything safe to expose publicly — no tokens, no keycloakId.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicProfileDto {
    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
    private String githubUsername;
    private String githubAvatarUrl;
    private String avatarPath;
    private String bio;
    private String company;
    private String location;
    private String websiteUrl;
    private String twitterUsername;
    private List<UserSkillDto> skills;

    // Follow stats — populated on every public profile request
    private long followerCount;
    private long followingCount;
    private boolean isFollowedByCurrentUser; // true when the requesting user follows this profile
}
