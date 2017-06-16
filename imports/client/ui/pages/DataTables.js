import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import DataTablesList from '../components/DataTablesList';

const DataTables = () => (
  <div className="Documents">
    <Row>
      <Col xs={12}>
        <div className="page-header clearfix">
          <h4 className="pull-left">React Data Grid Documents</h4>
          <Link to="/documents/new">
            <Button
              bsStyle="success"
              className="pull-right"
            >
              New Document
            </Button>
          </Link>
        </div>
        <DataTablesList />
      </Col>
    </Row>
  </div>
);

export default DataTables;
