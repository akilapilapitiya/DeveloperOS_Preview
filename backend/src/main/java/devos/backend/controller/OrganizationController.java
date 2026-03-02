package devos.backend.controller;

import devos.backend.dto.OrganizationDto;
import devos.backend.model.Organization;
import devos.backend.model.User;
import devos.backend.repository.OrganizationRepository;
import devos.backend.service.OrganizationService;
import devos.backend.service.UserService;
import devos.backend.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Slf4j
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationRepository organizationRepository;
    private final MembershipRepository membershipRepository;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<OrganizationDto> createOrganization(
            @RequestBody OrganizationDto dto,
            @AuthenticationPrincipal Jwt jwt) {
        
        log.info("Creating organization: {} with slug: {}", dto.getName(), dto.getSlug());
        
        try {
            String email = jwt.getClaimAsString("email");
            if (email == null) {
                email = jwt.getSubject() + "@placeholder.com";
                log.warn("Email claim missing for user {}, using placeholder", jwt.getSubject());
            }

            User user = userService.getOrCreateUser(
                    jwt.getSubject(),
                    jwt.getClaimAsString("preferred_username"),
                    email,
                    jwt.getClaimAsString("given_name"),
                    jwt.getClaimAsString("family_name")
            );

            Organization org = Organization.builder()
                    .name(dto.getName())
                    .slug(dto.getSlug())
                    .description(dto.getDescription())
                    .active(dto.getActive())
                    .location(dto.getLocation())
                    .establishedDate(dto.getEstablishedDate())
                    .industry(dto.getIndustry())
                    .website(dto.getWebsite())
                    .bannerPath(dto.getBannerPath())
                    .logoPath(dto.getLogoPath())
                    .build();
            
            Organization saved = organizationService.createOrganization(org, user.getId());
            log.info("Organization created successfully: {}", saved.getId());
            return new ResponseEntity<>(mapToDto(saved), HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Failed to create organization: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getOrCreateUser(
                jwt.getSubject(),
                jwt.getClaimAsString("preferred_username"),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name")
        );

        List<OrganizationDto> dtos = organizationService.getOrganizationsForUser(user.getId()).stream()
                .map(org -> {
                    OrganizationDto dto = mapToDto(org);
                    membershipRepository.findByUserAndOrganization(user, org)
                            .ifPresent(m -> dto.setCurrentUserRole(m.getRole()));
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<OrganizationDto> getOrganization(@PathVariable UUID id) {
        return organizationRepository.findById(id)
                .map(this::mapToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<OrganizationDto>> searchOrganizations(@RequestParam String query) {
        List<OrganizationDto> dtos = organizationService.searchOrganizations(query).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@security.hasOrgAccess(#id)")
    public ResponseEntity<OrganizationDto> getOrganizationById(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return organizationService.getOrganizationById(id)
                .map(org -> {
                    OrganizationDto dto = mapToDto(org);
                    if (jwt != null) {
                        try {
                            User user = userService.getCurrentUser();
                            membershipRepository.findByUserAndOrganization(user, org)
                                    .ifPresent(m -> dto.setCurrentUserRole(m.getRole()));
                        } catch (Exception e) {
                            log.debug("User context not available for mapping org role");
                        }
                    }
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@security.hasOrgRole(#id, 'OWNER', 'ADMIN')")
    public ResponseEntity<OrganizationDto> updateOrganization(@PathVariable UUID id, @RequestBody OrganizationDto dto) {
        Organization org = Organization.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .active(dto.getActive())
                .location(dto.getLocation())
                .establishedDate(dto.getEstablishedDate())
                .industry(dto.getIndustry())
                .website(dto.getWebsite())
                .bannerPath(dto.getBannerPath())
                .logoPath(dto.getLogoPath())
                .build();
        
        Organization updated = organizationService.updateOrganization(id, org);
        return ResponseEntity.ok(mapToDto(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@security.hasOrgRole(#id, 'OWNER')")
    public ResponseEntity<Void> deleteOrganization(@PathVariable UUID id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }

    private OrganizationDto mapToDto(Organization org) {
        return OrganizationDto.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .description(org.getDescription())
                .active(org.getActive())
                .createdAt(org.getCreatedAt())
                .location(org.getLocation())
                .establishedDate(org.getEstablishedDate())
                .industry(org.getIndustry())
                .website(org.getWebsite())
                .bannerPath(org.getBannerPath())
                .logoPath(org.getLogoPath())
                .build();
    }
}
