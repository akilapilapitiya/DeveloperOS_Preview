package devos.backend.dto;

import devos.backend.model.Membership;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
    
    private String location;
    private LocalDate establishedDate;
    private String industry;
    private String website;
    private String bannerPath;
    private String logoPath;
    
    // The requesting user's role in this organization (if applicable)
    private Membership.MembershipRole currentUserRole;
}
