package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.dto.LinkProjectCustomerDto;
import world.inetum.businessmapping.entity.ProjectEntity;

public interface ProjectRepository extends ReactiveNeo4jRepository<ProjectEntity, String> {

    Mono<ProjectEntity> findOneByName(String name);

    @Query("MATCH (c:Customer)-[:HAS_PROJECT]->(p:Project {name: $name}) RETURN p")
    Flux<ProjectEntity> findAllByCustomer(String name);


    @Query("MATCH (c:Customer)-[:HAS_PROJECT]->(p:Project) " +
            "RETURN p.uuid AS projectId, p.name AS projectName, c.uuid AS customerId, c.name AS customerName")
    Flux<LinkProjectCustomerDto> findAllCustomerProjectRelations();

}
