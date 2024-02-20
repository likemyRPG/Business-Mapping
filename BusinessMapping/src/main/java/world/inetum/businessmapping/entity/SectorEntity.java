package world.inetum.businessmapping.entity;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

@Node("Sector")
public class SectorEntity {
    @Id
    @GeneratedValue
    private Long id;

    @Property("name")
    private final String name;

    public SectorEntity(String name) {
        this.name = name;
    }
}