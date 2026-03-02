package devos.backend.service;

import devos.backend.dto.ProjectDto;
import devos.backend.model.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectService {
    ProjectDto createProject(UUID organizationId, Project project);
    ProjectDto createProject(UUID organizationId, ProjectDto projectDto);
    Optional<ProjectDto> getProjectById(UUID id);
    Optional<ProjectDto> getProjectBySlug(String slug);
    List<ProjectDto> getProjectsByOrganization(UUID organizationId);
    List<ProjectDto> getProjectsForCurrentUser();
    List<ProjectDto> searchProjects(String query);
    ProjectDto updateProject(UUID id, Project project);
    ProjectDto updateProject(UUID id, ProjectDto projectDto);
    ProjectDto updateAvatar(UUID id, String avatarPath);
    void deleteProject(UUID id);

    // GitHub Integration
    List<String> getAvailableGitHubRepositories(UUID projectId);
    void syncGitHubMetadata(UUID projectId);
    List<GitHubApiService.CommitDto> getProjectCommits(UUID projectId);
    GitHubApiService.GitHubInsightsDto getProjectGitHubInsights(UUID projectId);
}
