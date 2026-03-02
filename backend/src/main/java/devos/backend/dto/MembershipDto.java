package devos.backend.dto;

import devos.backend.model.Membership;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userFullName;
    private UUID organizationId;
    private Membership.MembershipRole role;
    private Membership.EnrollmentStatus status;
}
