package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.entity.ProjectEntity;

public interface ProjectRepository extends ReactiveNeo4jRepository<ProjectEntity, Long> {

    Mono<ProjectEntity> findOneById(Long id);
    Mono<ProjectEntity> findOneByName(String name);

    @Query("MATCH (p:Project) WHERE p.success = $success RETURN p")
    Flux<ProjectEntity> findAllBySuccess(boolean success);

    @Query("MATCH (p:Project) WHERE p.status = $status RETURN p")
    Flux<ProjectEntity> findAllByStatus(String status);

    @Query("MATCH (p:Project)-[:HAS_PROJECT]->(c:Customer) WHERE c.name = $customerName RETURN p")
    Flux<ProjectEntity> findAllByCustomerName(String customerName);

    @Query("MATCH (p:Project) WHERE p.year = $year RETURN p")
    Flux<ProjectEntity> findAllByYear(int year);

    @Query("MATCH (p:Project) WHERE p.endDate <= p.plannedEndDate RETURN p")
    Flux<ProjectEntity> findAllOnTimeProjects();

    @Query("MATCH (p:Project) WHERE p.endDate > p.plannedEndDate RETURN p")
    Flux<ProjectEntity> findAllDelayedProjects();
}
