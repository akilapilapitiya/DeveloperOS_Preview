package devos.backend.dto;

import devos.backend.model.ProjectMembership;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMembershipDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userFullName;
    private UUID projectId;
    private ProjectMembership.ProjectRole role;
    private LocalDateTime createdAt;
}
