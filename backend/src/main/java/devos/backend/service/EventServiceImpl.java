package devos.backend.service;

import devos.backend.dto.EventDto;
import devos.backend.dto.ProjectDto;
import devos.backend.model.Event;
import devos.backend.model.Organization;
import devos.backend.model.Project;
import devos.backend.model.EventParticipant;
import devos.backend.model.EventRole;
import devos.backend.model.User;
import devos.backend.repository.EventParticipantRepository;
import devos.backend.repository.EventRepository;
import devos.backend.repository.OrganizationRepository;
import devos.backend.repository.ProjectRepository;
import devos.backend.repository.MembershipRepository;
import devos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final MembershipRepository membershipRepository;
    private final UserService userService;

    @Override
    public EventDto createEvent(UUID organizationId, EventDto dto) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (eventRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Event with slug " + dto.getSlug() + " already exists");
        }

        Event event = Event.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .type(dto.getType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .maxProjectsPerUser(dto.getMaxProjectsPerUser())
                .status(dto.getStatus() != null ? dto.getStatus() : Event.EventStatus.OPEN)
                .organization(org)
                .build();

        event = eventRepository.save(event);

        User currentUser = userService.getCurrentUser();
        if (currentUser != null) {
            EventParticipant participant = EventParticipant.builder()
                    .event(event)
                    .user(currentUser)
                    .role(EventRole.ADMINISTRATOR)
                    .build();
            eventParticipantRepository.save(participant);
        }

        return mapToDto(event);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EventDto> getEventById(UUID id) {
        return eventRepository.findById(id).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDto> getEventsByOrganization(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        List<Event> allOrgEvents = eventRepository.findAllByOrganizationId(organizationId);
        User currentUser = userService.getCurrentUser();

        if (currentUser == null) {
            return allOrgEvents.stream().map(this::mapToDto).collect(Collectors.toList());
        }

        devos.backend.model.Membership membership = membershipRepository.findByUserAndOrganization(currentUser, organization).orElse(null);

        if (membership == null || membership.getRole() == devos.backend.model.Membership.MembershipRole.OWNER || membership.getRole() == devos.backend.model.Membership.MembershipRole.ADMIN) {
            return allOrgEvents.stream().map(this::mapToDto).collect(Collectors.toList());
        }

        // If DEVELOPER, only return events where they are an explicit participant OR have a project tied to it.
        return allOrgEvents.stream()
                .filter(event -> {
                    boolean isParticipant = eventParticipantRepository.existsByEventIdAndUserId(event.getId(), currentUser.getId());
                    if (isParticipant) return true;
                    
                    long projectsCount = projectRepository.countByEventIdAndCreatorId(event.getId(), currentUser.getId());
                    return projectsCount > 0;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public EventDto updateEvent(UUID id, EventDto dto) {
        return eventRepository.findById(id)
                .map(existing -> {
                    if (dto.getName() != null) existing.setName(dto.getName());
                    if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
                    if (dto.getType() != null) existing.setType(dto.getType());
                    if (dto.getStartDate() != null) existing.setStartDate(dto.getStartDate());
                    if (dto.getEndDate() != null) existing.setEndDate(dto.getEndDate());
                    if (dto.getMaxProjectsPerUser() != null) existing.setMaxProjectsPerUser(dto.getMaxProjectsPerUser());
                    if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
                    return mapToDto(eventRepository.save(existing));
                })
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Override
    public void deleteEvent(UUID id) {
        eventRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByEvent(UUID eventId) {
        return projectRepository.findByEventId(eventId).stream()
                .map(this::mapProjectToDto)
                .collect(Collectors.toList());
    }

    private EventDto mapToDto(Event event) {
        EventRole userRole = null;
        User currentUser = userService.getCurrentUser();
        
        if (currentUser != null) {
            userRole = eventParticipantRepository.findByEventIdAndUserId(event.getId(), currentUser.getId())
                    .map(EventParticipant::getRole)
                    .orElse(null);
        }

        return EventDto.builder()
                .id(event.getId())
                .name(event.getName())
                .slug(event.getSlug())
                .description(event.getDescription())
                .type(event.getType())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .maxProjectsPerUser(event.getMaxProjectsPerUser())
                .status(event.getStatus())
                .organizationId(event.getOrganization().getId())
                .currentUserRole(userRole)
                .createdAt(event.getCreatedAt())
                .build();
    }

    private ProjectDto mapProjectToDto(Project project) {
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .slug(project.getSlug())
                .description(project.getDescription())
                .organizationId(project.getOrganization().getId())
                .eventId(project.getEvent() != null ? project.getEvent().getId() : null)
                .eventName(project.getEvent() != null ? project.getEvent().getName() : null)
                .active(project.getActive())
                .build();
    }
}
