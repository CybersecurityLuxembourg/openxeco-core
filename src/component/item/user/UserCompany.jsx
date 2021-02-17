import React from 'react';
import './UserCompany.css';
import Loading from '../../box/Loading';
import Message from '../../box/Message';
import Address from '../../button/Address';
import {getRequest, postRequest, getForeignRequest} from '../../../utils/request';
import {NotificationManager as nm} from 'react-notifications';
import _ from 'lodash';
import Popup from "reactjs-popup";
import FormLine from '../../button/FormLine';
import Table from '../../table/Table';
import DialogConfirmation from '../../dialog/DialogConfirmation';


export default class UserCompany extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);
        this.addUserCompany = this.addUserCompany.bind(this);
        this.deleteUserCompany = this.deleteUserCompany.bind(this);

		this.state = {
            companies: null,
            selectedCompany: null,
            allCompanies: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

    refresh() {
        getRequest.call(this, "user/get_user_companies/" + this.props.id, data => {
            this.setState({
                companies: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        getRequest.call(this, "company/get_companies", data => {
            this.setState({
                allCompanies: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    addUserCompany() {
    	 let params = {
            user: this.props.id,
            company: this.state.selectedCompany
        }

        postRequest.call(this, "user/add_user_company", params, response => {
            this.refresh();
            nm.info("The company has been added to the user");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    deleteUserCompany(id) {
        let params = {
            user: this.props.id,
            company: id,
        }

        postRequest.call(this, "user/delete_user_company", params, response => {
            this.refresh();
            nm.info("The row has been deleted");
        }, response => {
            this.refresh();
            nm.warning(response.statusText);
        }, error => {
            this.refresh();
            nm.error(error.message);
        });
    }

    changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
        let columns = [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: ' ',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <DialogConfirmation
                        text={"Are you sure you want to delete this row?"}
                        trigger={
                            <button
                                className={"small-button red-background Table-right-button"}>
                                <i className="fas fa-trash-alt"/>
                            </button>
                        }
                        afterConfirmation={() => this.deleteUserCompany(value.id)}
                    />
                ),
                width: 50,
            },
        ];

		return (
			<div className={"row"}>
				<div className="col-md-12">
                    <h2>Company</h2>
                </div>

                <div className="col-md-12">
                    {this.state.companies !== null ?
                        <Table
                            columns={columns}
                            data={this.state.companies}
                        />
                        :
                        <Loading/>
                    }
                </div>

                <div className="col-md-12">
                    <h2>Add a company</h2>
                    {this.state.allCompanies !== null ?
                        <div>
                            <FormLine
                                label={"Company"}
                                type={"select"}
                                value={this.state.selectedCompany}
                                options={this.state.allCompanies === null ? [] :
                                    [{value: null, label: "-"}].concat(
                                        this.state.allCompanies.map(c => { return {label: c.name, value: c.id}})
                                    )}
                                onChange={v => this.setState({ "selectedCompany": v })}
                            />
                            <div className="right-buttons">
                                <button
                                    onClick={this.addUserCompany}
                                    disabled={this.state.selectedCompany === null}>
                                    Add the company
                                </button>
                            </div>
                        </div>
                        :
                        <Loading
                            height={150}
                        />
                    }
                </div>
			</div>
		);
	}
}