package world.inetum.businessmapping.repository;

import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import reactor.core.publisher.Flux;
import world.inetum.businessmapping.dto.LinkAccountManagerSectorDto;
import world.inetum.businessmapping.entity.AccountManagerEntity;

public interface AccountManagerRepository extends ReactiveNeo4jRepository<AccountManagerEntity, String> {
    @Query("MATCH (a:AccountManager)-[:MANAGES]->(s:Sector) " +
            "RETURN a.uuid AS accountManagerId, a.name AS accountManagerName, s.uuid AS sectorId, s.name AS sectorName")
    Flux<LinkAccountManagerSectorDto> findAllAccountManagerSectorRelations();
}
