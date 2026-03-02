package devos.backend.service.impl;

import devos.backend.dto.EventParticipantDto;
import devos.backend.model.Event;
import devos.backend.model.EventParticipant;
import devos.backend.model.EventRole;
import devos.backend.model.Membership;
import devos.backend.model.User;
import devos.backend.repository.EventParticipantRepository;
import devos.backend.repository.EventRepository;
import devos.backend.repository.MembershipRepository;
import devos.backend.repository.UserRepository;
import devos.backend.service.EventParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventParticipantServiceImpl implements EventParticipantService {

    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @Override
    public EventParticipantDto addParticipant(UUID eventId, UUID userId, EventRole role) {
        if (participantRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("User is already a participant of this event");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .user(user)
                .role(role)
                .build();

        return mapToDto(participantRepository.save(participant));
    }

    @Override
    public void removeParticipant(UUID eventId, UUID userId) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participantRepository.delete(participant);
    }

    @Override
    public EventParticipantDto updateParticipantRole(UUID eventId, UUID userId, EventRole role) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        participant.setRole(role);
        return mapToDto(participantRepository.save(participant));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventParticipantDto> getEventParticipants(UUID eventId) {
        return participantRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventParticipantDto> getUserEvents(UUID userId) {
        // 1. Get explicit participants
        List<EventParticipant> explicitParticipants = participantRepository.findByUserId(userId);
        Set<UUID> explicitEventIds = explicitParticipants.stream()
                .map(ep -> ep.getEvent().getId())
                .collect(Collectors.toSet());

        List<EventParticipantDto> dtos = explicitParticipants.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // 2. Get implicit participants via organization membership
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Membership> memberships = membershipRepository.findByUser(user);

        for (Membership membership : memberships) {
            List<Event> orgEvents = eventRepository.findAllByOrganizationId(membership.getOrganization().getId());
            for (Event event : orgEvents) {
                if (!explicitEventIds.contains(event.getId())) {
                    EventRole implicitRole = (membership.getRole() == Membership.MembershipRole.OWNER) 
                            ? EventRole.ADMINISTRATOR 
                            : EventRole.PARTICIPANT;

                    dtos.add(EventParticipantDto.builder()
                            .id(UUID.randomUUID()) // Transient ID
                            .eventId(event.getId())
                            .eventName(event.getName())
                            .organizationName(membership.getOrganization().getName())
                            .userId(user.getId())
                            .username(user.getUsername() != null ? user.getUsername() : user.getGithubUsername())
                            .avatarPath(user.getAvatarPath())
                            .githubAvatarUrl(user.getGithubAvatarUrl())
                            .role(implicitRole)
                            .joinedAt(event.getCreatedAt())
                            .build());
                }
            }
        }

        return dtos;
    }

    private EventParticipantDto mapToDto(EventParticipant participant) {
        return EventParticipantDto.builder()
                .id(participant.getId())
                .eventId(participant.getEvent().getId())
                .eventName(participant.getEvent().getName())
                .organizationName(participant.getEvent().getOrganization() != null ? participant.getEvent().getOrganization().getName() : null)
                .userId(participant.getUser().getId())
                .username(participant.getUser().getUsername() != null ? participant.getUser().getUsername() : participant.getUser().getGithubUsername())
                .avatarPath(participant.getUser().getAvatarPath())
                .githubAvatarUrl(participant.getUser().getGithubAvatarUrl())
                .role(participant.getRole())
                .joinedAt(participant.getJoinedAt())
                .build();
    }
}
