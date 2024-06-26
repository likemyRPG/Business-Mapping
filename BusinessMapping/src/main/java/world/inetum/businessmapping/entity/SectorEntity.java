package world.inetum.businessmapping.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

@Data
@Node("Sector")
@NoArgsConstructor
public class SectorEntity {
    @Id
    private String uuid;

    @Property("name")
    private String name;
}