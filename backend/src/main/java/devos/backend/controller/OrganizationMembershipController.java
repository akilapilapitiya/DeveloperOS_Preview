package devos.backend.controller;

import devos.backend.dto.MembershipDto;
import devos.backend.model.Membership;
import devos.backend.model.User;
import devos.backend.service.MembershipService;
import devos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/members")
@RequiredArgsConstructor
@Slf4j
public class OrganizationMembershipController {

    private final MembershipService membershipService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("@security.hasOrgAccess(#organizationId)")
    public ResponseEntity<List<MembershipDto>> getMembers(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(membershipService.getMembersByOrganization(organizationId));
    }

    @PostMapping
    @PreAuthorize("@security.hasOrgRole(#organizationId, 'OWNER', 'ADMIN')")
    public ResponseEntity<MembershipDto> addMember(
            @PathVariable UUID organizationId,
            @RequestBody MembershipDto dto) {
        
        Membership.MembershipRole role = dto.getRole() != null ? dto.getRole() : Membership.MembershipRole.DEVELOPER;
        
        return ResponseEntity.ok(membershipService.addMember(organizationId, dto.getUserEmail(), role));
    }

    @DeleteMapping("/{membershipId}")
    @PreAuthorize("@security.hasOrgRole(#organizationId, 'OWNER', 'ADMIN')")
    public ResponseEntity<Void> removeMember(@PathVariable UUID organizationId, @PathVariable UUID membershipId) {
        membershipService.removeMember(membershipId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/enroll")
    public ResponseEntity<MembershipDto> enroll(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreateUser(jwt.getSubject(), jwt.getClaimAsString("preferred_username"), jwt.getClaimAsString("email"), null, null);
        return ResponseEntity.ok(membershipService.enrollInOrganization(organizationId, user.getId()));
    }

    @GetMapping("/pending")
    @PreAuthorize("@security.hasOrgRole(#organizationId, 'OWNER', 'ADMIN')")
    public ResponseEntity<List<MembershipDto>> getPendingRequests(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(membershipService.getPendingMemberships(organizationId));
    }

    @PutMapping("/{membershipId}/status")
    @PreAuthorize("@security.hasOrgRole(#organizationId, 'OWNER', 'ADMIN')")
    public ResponseEntity<MembershipDto> updateStatus(
            @PathVariable UUID organizationId,
            @PathVariable UUID membershipId,
            @RequestBody Map<String, String> body) {
        Membership.EnrollmentStatus status = Membership.EnrollmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(membershipService.updateMembershipStatus(membershipId, status));
    }

    @PutMapping("/{membershipId}/role")
    @PreAuthorize("@security.hasOrgRole(#organizationId, 'OWNER')")
    public ResponseEntity<MembershipDto> updateRole(
            @PathVariable UUID organizationId,
            @PathVariable UUID membershipId,
            @RequestBody Map<String, String> body) {
        Membership.MembershipRole role = Membership.MembershipRole.valueOf(body.get("role"));
        return ResponseEntity.ok(membershipService.updateMembershipRole(membershipId, role));
    }

}
