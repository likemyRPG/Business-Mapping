package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.entity.ProjectEntity;

public interface ProjectRepository extends ReactiveNeo4jRepository<ProjectEntity, Long> {

    Mono<ProjectEntity> findOneById(Long id);
    Mono<ProjectEntity> findOneByName(String name);
}
