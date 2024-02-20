package world.inetum.businessmapping.entity;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

@Node("Project")
public class ProjectEntity {
    @Id
    @GeneratedValue
    private Long id;

    @Property("name")
    private final String name;

    @Property("success")
    private final boolean success;

    public ProjectEntity(String name) {
        this.name = name;
        this.success = true;
    }
}