package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import world.inetum.businessmapping.dto.CustomerSectorDto;
import world.inetum.businessmapping.entity.CustomerEntity;

public interface CustomerRepository extends ReactiveNeo4jRepository<CustomerEntity, String> {
    Mono<CustomerEntity> findOneByName(String name);

    @Query("MATCH (c:Customer)-[:OPERATES_IN]->(s:Sector {name: $sector}) RETURN c")
    Flux<CustomerEntity> findAllBySector(String sector);

    @Query("MATCH (c:Customer)-[:OPERATES_IN]->(s:Sector) " +
            "RETURN c.uuid AS customerId, c.name AS customerName, s.uuid AS sectorId, s.name AS sectorName")
    Flux<CustomerSectorDto> findAllCustomerSectorRelations();

}
