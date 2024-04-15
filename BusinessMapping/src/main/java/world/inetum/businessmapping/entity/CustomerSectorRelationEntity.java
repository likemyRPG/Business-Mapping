package world.inetum.businessmapping.entity;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

@Node("CustomerSectorRelation")
@Data
public class CustomerSectorRelationEntity {

    @Id
    @GeneratedValue
    private Long id;

    @Relationship(type = "OPERATES_IN", direction = Relationship.Direction.INCOMING)
    private SectorEntity sector;

    private CustomerEntity customer;
}
