package devos.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kohsuke.github.GHAppInstallation;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubApiService {

    /**
     * Gets a GitHub instance authenticated with a user access token.
     */
    public GitHub getGitHubClient(String token) {
        try {
            return new GitHubBuilder().withAppInstallationToken(token).build();
        } catch (Exception e) {
            log.error("Failed to initialize GitHub client with user token", e);
            throw new RuntimeException("GitHub Client Initialization Failed", e);
        }
    }

    /**
     * Lists all repositories the authenticated user has access to.
     */
    public List<String> listRepositories(String token) {
        try {
            GitHub gitHub = getGitHubClient(token);
            // listAllRepositories() might be slow, so listRepositories() on Myselft is better
            return gitHub.getMyself().listRepositories().toList().stream()
                    .map(GHRepository::getFullName)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to list repositories for user token", e);
            return Collections.emptyList();
        }
    }

    /**
     * Fetches metadata for a specific repository.
     */
    public RepositoryMetadata getRepositoryMetadata(String token, String fullName) {
        try {
            GitHub gitHub = getGitHubClient(token);
            GHRepository repo = gitHub.getRepository(fullName);
            
            String readme = "";
            try {
                readme = repo.getReadme().getContent();
            } catch (Exception e) {
                log.warn("No README found for repository {}", fullName);
            }

            return RepositoryMetadata.builder()
                    .fullName(repo.getFullName())
                    .description(repo.getDescription())
                    .stars(repo.getStargazersCount())
                    .forks(repo.getForksCount())
                    .language(repo.getLanguage())
                    .defaultBranch(repo.getDefaultBranch())
                    .readme(readme)
                    .homepage(repo.getHomepage())
                    .topics(repo.listTopics())
                    .build();
        } catch (Exception e) {
            log.error("Failed to fetch metadata for repository {} with user token", fullName, e);
            throw new RuntimeException("GitHub Metadata Fetch Failed", e);
        }
    }

    /**
     * Fetches the latest commits for a specific repository.
     */
    public List<CommitDto> fetchCommits(String token, String repoFullName, int limit) {
        try {
            GitHub gitHub = getGitHubClient(token);
            GHRepository repo = gitHub.getRepository(repoFullName);
            
            return repo.listCommits().toList().stream()
                    .limit(limit)
                    .map(commit -> {
                        try {
                            return CommitDto.builder()
                                    .sha(commit.getSHA1())
                                    .message(commit.getCommitShortInfo().getMessage())
                                    .authorName(commit.getCommitShortInfo().getAuthor().getName())
                                    .authorEmail(commit.getCommitShortInfo().getAuthor().getEmail())
                                    .authorUrl(commit.getAuthor() != null ? commit.getAuthor().getHtmlUrl().toString() : null)
                                    .avatarUrl(commit.getAuthor() != null ? commit.getAuthor().getAvatarUrl() : null)
                                    .date(commit.getCommitShortInfo().getAuthoredDate())
                                    .url(commit.getHtmlUrl().toString())
                                    .build();
                        } catch (Exception e) {
                            log.error("Failed to map commit {}", commit.getSHA1(), e);
                            return null;
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch commits for repository {} with user token", repoFullName, e);
            return Collections.emptyList();
        }
    }

    @lombok.Builder
    @lombok.Getter
    public static class RepositoryMetadata {
        private String fullName;
        private String description;
        private int stars;
        private int forks;
        private String language;
        private String defaultBranch;
        private String readme;
        private String homepage;
        private List<String> topics;
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class CommitDto {
        private String sha;
        private String message;
        private String authorName;
        private String authorEmail;
        private String authorUrl;
        private String avatarUrl;
        private java.util.Date date;
        private String url;
    }

    /**
     * Fetches live insights (languages and branches) for a repository.
     */
    public GitHubInsightsDto fetchInsights(String token, String repoFullName) {
        try {
            GitHub gitHub = getGitHubClient(token);
            GHRepository repo = gitHub.getRepository(repoFullName);

            // Fetch Languages
            java.util.Map<String, Long> languages = repo.listLanguages();

            // Fetch Branches
            List<String> branches = repo.getBranches().keySet().stream()
                    .collect(Collectors.toList());

            return GitHubInsightsDto.builder()
                    .languages(languages)
                    .branches(branches)
                    .defaultBranch(repo.getDefaultBranch())
                    .build();
        } catch (Exception e) {
            log.error("Failed to fetch insights for repository {} with user token", repoFullName, e);
            return GitHubInsightsDto.builder()
                    .languages(Collections.emptyMap())
                    .branches(Collections.emptyList())
                    .build();
        }
    }

    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class GitHubInsightsDto {
        private java.util.Map<String, Long> languages;
        private List<String> branches;
        private String defaultBranch;
    }
}
