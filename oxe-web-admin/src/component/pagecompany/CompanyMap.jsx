import React from "react";
import "./CompanyMap.css";
import { NotificationManager as nm } from "react-notifications";
import GlobalMap from "../map/GlobalMap.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import DialogCompanyFilter from "../dialog/DialogCompanyFilter.jsx";

export default class CompanyMap extends React.Component {
	constructor(props) {
		super(props);

		this.refreshAddresses = this.refreshAddresses.bind(this);
		this.getFilteredAddresses = this.getFilteredAddresses.bind(this);

		this.state = {
			addresses: null,
			filteredCompanies: null,
			filteredAddresses: null,
			loading: null,
		};
	}

	componentDidMount() {
		this.refreshAddresses();
	}

	componentDidUpdate(prevProps) {
		if (this.props.companies !== prevProps.companies
			|| this.props.filters !== prevProps.filters) {
			this.refreshAddresses();
		}
	}

	refreshAddresses() {
		this.setState({
			addresses: null,
			loading: true,
		});

		getRequest.call(this, "address/get_all_addresses", (data) => {
			this.setState({
				loading: false,
				addresses: data,
			}, () => {
				this.setState({
					filteredAddresses: this.getFilteredAddresses(),
				});
			});
		}, (response) => {
			nm.warning(response.statusText);
			this.setState({ loading: false });
		}, (error) => {
			nm.error(error.message);
			this.setState({ loading: false });
		});
	}

	getFilteredAddresses() {
		if (!this.state.addresses || !this.props.companies) {
			return this.state.addresses;
		}
		const filteredCompanyIDs = this.props.companies.map((c) => c.id);
		return this.state.addresses
			.filter((a) => filteredCompanyIDs.indexOf(a.company_id) >= 0);
	}

	render() {
		return (
			<div id="CompanyMap" className="full-page">
				<div className="CompanyMap-map">
					<GlobalMap
						addresses={this.state.filteredAddresses}
					/>

					{this.state.loading
						&& <div className="CompanyMap-Loading">
							<Loading/>
						</div>}
				</div>

				<div className={"row row-spaced CompanyMap-buttons"}>
					<div className="col-md-12">
						<div className="top-right-buttons">
							<button
								className={"blue-background"}
								data-hover="Refresh"
								data-active=""
								onClick={this.refreshAddresses}>
								<span><i className="fas fa-redo-alt"/></span>
							</button>
							<DialogCompanyFilter
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<i className="fas fa-search"/>
									</button>
								}
								filters={this.props.filters}
								applyFilter={(filters) => this.props.applyFilter(filters)}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
