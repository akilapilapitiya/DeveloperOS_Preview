package devos.backend.service;

import devos.backend.dto.MembershipDto;
import devos.backend.model.Membership;
import devos.backend.model.Organization;
import devos.backend.model.User;
import devos.backend.repository.MembershipRepository;
import devos.backend.repository.OrganizationRepository;
import devos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipServiceImpl implements MembershipService {

    private final MembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MembershipDto> getMembersByOrganization(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        return membershipRepository.findByOrganization(organization).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MembershipDto addMember(UUID organizationId, String email, Membership.MembershipRole role) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email " + email + " not found. They must login to DeveloperOS at least once."));

        if (membershipRepository.existsByUserAndOrganization(user, organization)) {
            throw new RuntimeException("User is already a member of this organization");
        }

        Membership membership = Membership.builder()
                .user(user)
                .organization(organization)
                .role(role)
                .build();
        
        return mapToDto(membershipRepository.save(membership));
    }

    @Override
    public void removeMember(UUID membershipId) {
        membershipRepository.deleteById(membershipId);
    }

    @Override
    public MembershipDto enrollInOrganization(UUID organizationId, UUID userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (membershipRepository.existsByUserAndOrganization(user, organization)) {
            throw new RuntimeException("User already has a membership or request for this organization");
        }

        Membership membership = Membership.builder()
                .user(user)
                .organization(organization)
                .role(Membership.MembershipRole.DEVELOPER)
                .status(Membership.EnrollmentStatus.PENDING)
                .build();
        
        return mapToDto(membershipRepository.save(membership));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipDto> getPendingMemberships(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        return membershipRepository.findByOrganizationAndStatus(organization, Membership.EnrollmentStatus.PENDING)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MembershipDto updateMembershipStatus(UUID membershipId, Membership.EnrollmentStatus status) {
        Membership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        membership.setStatus(status);
        return mapToDto(membershipRepository.save(membership));
    }

    @Override
    public MembershipDto updateMembershipRole(UUID membershipId, Membership.MembershipRole role) {
        Membership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        membership.setRole(role);
        return mapToDto(membershipRepository.save(membership));
    }

    private MembershipDto mapToDto(Membership membership) {
        if (membership == null) return null;
        UUID userId = membership.getUser() != null ? membership.getUser().getId() : null;
        String email = membership.getUser() != null ? membership.getUser().getEmail() : "unknown";
        String fullName = "Unknown";
        if (membership.getUser() != null) {
            String firstName = membership.getUser().getFirstName() != null ? membership.getUser().getFirstName() : "";
            String lastName = membership.getUser().getLastName() != null ? membership.getUser().getLastName() : "";
            fullName = (firstName + " " + lastName).trim();
            if (fullName.isEmpty()) fullName = email;
        }

        return MembershipDto.builder()
                .id(membership.getId())
                .userId(userId)
                .userEmail(email)
                .userFullName(fullName)
                .organizationId(membership.getOrganization().getId())
                .role(membership.getRole())
                .status(membership.getStatus())
                .build();
    }
}
