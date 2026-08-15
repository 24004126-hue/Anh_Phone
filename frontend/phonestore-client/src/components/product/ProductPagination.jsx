import { Pagination } from "react-bootstrap";

function ProductPagination({

    page,

    totalPages,

    onPageChange

}) {

    if (totalPages <= 1)
        return null;

    const items = [];

    for (let i = 1; i <= totalPages; i++) {

        items.push(

            <Pagination.Item

                key={i}

                active={i === page}

                onClick={() => onPageChange(i)}

            >

                {i}

            </Pagination.Item>

        );

    }

    return (

        <div className="d-flex justify-content-center mt-4">

            <Pagination>

                {items}

            </Pagination>

        </div>

    );

}

export default ProductPagination;