import React, { Component } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import ReactDataGrid from 'react-data-grid';
// import BootstrapPaginator from 'react-bootstrap-pagination';
import PropTypes from 'prop-types';
import IdCell from './IdCell';
// import container from '../../../modules/container';
import Loading from '../components/Loading';
import { findDocument } from '../../../api/documents/methods.js';

class DataTablesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      filters: {},
      sort: {},
      perPage: 10,
    };

    this.data = {
      documents: null,
      currentPage: null,
      totalPages: null,
      totalItems: null,
    };

    this.pageLimits = [10, 25, 50, 100];
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate() {
    this.getData();
  }

  getData = () => {
    if (this.state.loading) {
      const {
        filters,
        sort,
        perPage,
      } = this.state;

      findDocument.call({ filters, perPage, sort }, (error, response) => {
        if (error) {
          console.log(error);
        } else {
          const {
            documents,
            totalItems,
          } = response;

          this.data = {
            documents,
            currentPage: 1,
            totalPages: Math.ceil((totalItems / perPage) || 1),
            totalItems,
          };

          this.setState({
            loading: false,
          });
        }
      });
    }
  };

  limitChange = (event) => {
    event.preventDefault();

    this.setState({ perPage: parseInt(this.perPageSelect.value, 10), loading: true });
  };

  searchItems = (event) => {
    event.preventDefault();

    const filters = {
      title: { $regex: this.search.value, $options: 'i' },
      body: { $regex: this.search.value, $options: 'i' },
    };

    this.setState({ filters, loading: true });
  };

  gridSort = (sortColumn, sortDirection) => {
    const sort = {};

    switch (sortDirection) {
      case 'ASC':
        sort[sortColumn] = 1;
        break;

      case 'DESC':
        sort[sortColumn] = -1;
        break;

      default:
        break;
    }

    this.data = {
      documents: null,
      currentPage: null,
      totalPages: null,
      totalItems: null,
    };

    this.setState({ sort, loading: true });
  };

  render() {
    const {
      loading,
      perPage,
    } = this.state;

    if (loading) {
      return <Loading />;
    }

    const {
      documents,
      currentPage,
      totalPages,
      totalItems,
    } = this.data;

    const columns = [
      { key: '_id', name: 'ID', formatter: <IdCell />, sortable: true },
      { key: 'title', name: 'Title', sortable: true },
      { key: 'body', name: 'Body' },
    ];

    const tableHeight = (35 * (documents.length + 1)) + 2;

    let showingFrom = (currentPage * perPage) - perPage;
    showingFrom = (showingFrom === 0) ? 1 : showingFrom;

    let showingTo = currentPage * perPage;
    if (currentPage === totalPages) {
      showingTo = totalItems;
    }

    return (
      documents.length > 0 ? (
        <div className="row">
          <Row>
            <Col xs={6}>
              <div className="text-right">
                <label htmlFor="per-page">
                  Per page:
                  <select ref={(c) => { this.perPageSelect = c; }} name="per-page" defaultValue={perPage} className="form-control input-sm" onChange={this.limitChange} >
                    {this.pageLimits.map(limit => (
                      <option key={limit} value={limit}>{limit}</option>
                    ))}
                  </select>
                </label>
              </div>
            </Col>
            <Col xs={6}>
              <div className="text-right">
                <label htmlFor="search">
                  <input
                    name="search"
                    ref={(c) => { this.search = c; }}
                    type="search"
                    className="form-control input-sm"
                    placeholder="Search..."
                  />
                </label>
                <Button bsStyle="success" className="pull-right" onClick={this.searchItems}>
                  Search
                </Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <ReactDataGrid
                columns={columns}
                rowGetter={i => (documents[i])}
                rowsCount={documents.length}
                minHeight={tableHeight}
                onGridSort={this.gridSort}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <div className="pagination">
                Showing {showingFrom} to {showingTo} of {totalItems} entries
              </div>
            </Col>
            <Col xs={8}>
              {/* <BootstrapPaginator
                pagination={pagination}
                limit={10}
                containerClass="text-right"
              />*/}
            </Col>
          </Row>
        </div>
      ) : <Alert bsStyle="warning">No documents yet.</Alert>
    );
  }
}

export default DataTablesList;
