package devos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowStatsDto {
    private long followerCount;
    private long followingCount;
    private boolean isFollowing; // true when the requesting user follows this profile
}
