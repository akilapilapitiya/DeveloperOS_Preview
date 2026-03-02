package devos.backend.service;

import devos.backend.dto.MembershipDto;
import devos.backend.model.Membership;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public interface MembershipService {
    List<MembershipDto> getMembersByOrganization(UUID organizationId);
    MembershipDto addMember(UUID organizationId, String email, Membership.MembershipRole role);
    void removeMember(UUID membershipId);
    
    MembershipDto enrollInOrganization(UUID organizationId, UUID userId);
    List<MembershipDto> getPendingMemberships(UUID organizationId);
    MembershipDto updateMembershipStatus(UUID membershipId, Membership.EnrollmentStatus status);
    MembershipDto updateMembershipRole(UUID membershipId, Membership.MembershipRole role);
}
