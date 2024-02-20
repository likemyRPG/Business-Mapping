package world.inetum.businessmapping.entity;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

@Data
@RequiredArgsConstructor
@Node("Customer")
public class CustomerEntity {

    @Id
    private String uuid;

    @Property("name")
    private final String name;

    @Property("size")
    private final String size;

    @Property("location")
    private final String location;
}