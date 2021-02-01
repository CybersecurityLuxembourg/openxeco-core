import React from 'react';
import './PageMap.css';
import GlobalMap from './map/GlobalMap';
import {getRequest} from '../utils/request';
import {NotificationManager as nm} from 'react-notifications';
import Loading from "./box/Loading";
import DialogCompanyFilter from './dialog/DialogCompanyFilter';


export default class PageMap extends React.Component {

	constructor(props){
		super(props);

		this.refreshAddresses = this.refreshAddresses.bind(this);
		this.getFilteredAddresses = this.getFilteredAddresses.bind(this);
		this.applyFilter = this.applyFilter.bind(this);

		this.state = {
			loading: false,
			addresses: null,
			filteredCompanies: null,
			filteredAddresses: null,
			companies: null,
		}
	}

	componentDidMount() {
		this.refreshAddresses();
	}

	refreshAddresses() {
		this.setState({
			addresses: null,
			loading: true,
		});

		getRequest.call(this, "address/get_all_addresses", data => {
            this.setState({
            	loading: false,
                addresses: data,
            }, () => {
            	this.setState({
                	filteredAddresses: this.getFilteredAddresses(),
            	})
            });
        }, response => {
            nm.warning(response.statusText);
            this.setState({ loading: false });
        }, error => {
            nm.error(error.message);
            this.setState({ loading: false });
        });
	}

	applyFilter(filters) {
		if (Object.keys(filters).length == 0) {
			this.setState({ filters: filters, filteredCompanies: null });
		} else {
			let params = "?";
			this.setState({ loading: true, filteredAddresses: null })

			Object.keys(filters).forEach(key => {
			   	if (typeof filters[key] === "boolean" && filters[key])
					params += key + "=" + filters[key] + "&"
				if (typeof filters[key] === "string" && filters[key].length > 0)
					params += key + "=" + filters[key] + "&"
				if (Array.isArray(filters[key]) && filters[key].length > 0)
					params += key + "=" + filters[key].join(",") + "&"
			});

			getRequest.call(this, "company/get_companies" + params, data => {
	            this.setState({
	                filteredCompanies: data,
	                loading: false
	            }, () => {
	            	this.setState({
	                	filteredAddresses: this.getFilteredAddresses(data),
	            	})
	            });
	        }, response => {
	        	this.setState({ loading: false });
	            nm.warning(response.statusText);
	        }, error => {
	        	this.setState({ loading: false });
	            nm.error(error.message);
	        });
		}
	}

	getFilteredAddresses() {
		if (this.state.addresses === null || this.state.filteredCompanies === null) {
			return this.state.addresses
		} else {
			let filteredCompanyIDs = this.state.filteredCompanies.map(c => { return c.id });
			return this.state.addresses
				.filter(a => filteredCompanyIDs.indexOf(a.company_id) >= 0)
		}
	}

	render() {
		return (
			<div id="PageMap" className="full-page">
				<GlobalMap
					addresses={this.state.filteredAddresses}
				/>
				{this.state.loading ?
					<div className="PageMap-Loading">
						<Loading/>
					</div>
				: ""}
                <div className="PageMap-buttons">
                    <button
                        className={"blue-background"}
                        data-hover="Refresh"
                        data-active=""
                        onClick={this.refreshAddresses}>
                        <span><i className="fas fa-redo-alt"/></span>
                    </button>
                    <br/>
                    <DialogCompanyFilter
                        trigger={
                            <button
                                className={"blue-background"}
                                data-hover="Filter">
                                <span><i className="fas fa-shapes"/></span>
                            </button>
                        }
                        applyFilter={filters => this.applyFilter(filters)}
                    />
                </div>
                {this.state.filteredCompanies !== null && this.state.filteredAddresses !== null ?
	                <div className="PageMap-company-count">
	                    <h2>
	                    	{this.state.filteredCompanies.length} Compan{this.state.filteredCompanies.length > 1 ? "ies": "y"}
	                    	<br/>
	                    	{this.state.filteredAddresses.length} Address{this.state.filteredAddresses.length > 1 ? "es": ""}
	                    </h2>
	                </div>
                : ""}
			</div>
		);
	}
}