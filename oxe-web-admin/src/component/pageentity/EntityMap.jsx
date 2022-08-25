import React from "react";
import "./EntityMap.css";
import { NotificationManager as nm } from "react-notifications";
import GlobalMap from "../map/GlobalMap.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import DialogEntityFilter from "../dialog/DialogEntityFilter.jsx";

export default class EntityMap extends React.Component {
	constructor(props) {
		super(props);

		this.refreshAddresses = this.refreshAddresses.bind(this);
		this.getFilteredAddresses = this.getFilteredAddresses.bind(this);

		this.state = {
			addresses: null,
			filteredEntities: null,
			filteredAddresses: null,
			loading: null,
		};
	}

	componentDidMount() {
		this.refreshAddresses();
	}

	componentDidUpdate(prevProps) {
		if (this.props.entities !== prevProps.entities
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
		if (!this.state.addresses || !this.props.entities) {
			return this.state.addresses;
		}
		const filteredEntityIDs = this.props.entities.map((c) => c.id);
		return this.state.addresses
			.filter((a) => filteredEntityIDs.indexOf(a.entity_id) >= 0);
	}

	render() {
		return (
			<div id="EntityMap" className="full-page">
				<div className="EntityMap-map">
					<GlobalMap
						addresses={this.state.filteredAddresses}
					/>

					{this.state.loading
						&& <div className="EntityMap-Loading">
							<Loading/>
						</div>}
				</div>

				<div className={"row row-spaced EntityMap-buttons"}>
					<div className="col-md-12">
						<h1>
							{this.props.entities ? this.props.entities.length : 0}
							&nbsp;Entit{this.props.entities && this.props.entities.length > 1 ? "ies" : "y"}
						</h1>

						<div className="top-right-buttons">
							<button
								className={"blue-background"}
								data-hover="Refresh"
								data-active=""
								onClick={this.refreshAddresses}>
								<span><i className="fas fa-redo-alt"/></span>
							</button>
							<DialogEntityFilter
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
