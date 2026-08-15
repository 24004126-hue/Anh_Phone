import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

function ProductSearch({ onSearch }) {

    const [keyword, setKeyword] = useState("");

    function handleSubmit(e) {

        e.preventDefault();

        onSearch(keyword);

    }

    return (

        <Form onSubmit={handleSubmit} className="mb-4">

            <Row>

                <Col md={10}>

                    <Form.Control
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />

                </Col>

                <Col md={2}>

                    <Button
                        className="w-100"
                        type="submit"
                    >

                        Tìm kiếm

                    </Button>

                </Col>

            </Row>

        </Form>

    );

}

export default ProductSearch;