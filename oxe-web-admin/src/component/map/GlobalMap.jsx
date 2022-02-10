import React from "react";
import "./GlobalMap.css";
import L from "leaflet";
import {
	Map, TileLayer, Marker, Popup,
} from "react-leaflet";
import { NotificationManager as nm } from "react-notifications";
import Company from "../item/Company.jsx";
import { getRequest } from "../../utils/request.jsx";

export default class GlobalMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lat: 49.8116,
			lng: 6.1319,
			zoom: 10,
			selectedCompanyId: null,
			selectedCompanyName: null,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedCompanyId !== this.state.selectedCompanyId
            && this.state.selectedCompanyId !== null) {
			getRequest.call(this, "company/get_company/" + this.state.selectedCompanyId, (data) => {
				this.setState({
					selectedCompanyName: data.name,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	handlePopupClose() {
		this.setState({ selectedCompanyId: null, selectedCompanyName: null });
	}

	handlePopupOpen(companyId) {
		this.setState({ selectedCompanyId: companyId });
	}

	render() {
		const thisIcon = new L.Icon({
			iconUrl: "/img/marker-icon-2x.png",
			iconSize: [24, 36],
			iconAnchor: [12, 36],
			popupAnchor: [0, -36],
		});

		return (
			<div className={"full-page"}>
				<Map
					center={[this.state.lat, this.state.lng]}
					zoom={this.state.zoom}
					style={{ width: "100%", height: "100%" }}
					onPopupClose={() => this.handlePopupClose()}
					onPopupOpen={(e) => this.handlePopupOpen(e.popup.options.companyId)}
				>
					{Array.isArray(this.props.addresses)
						? this.props.addresses
							.filter((a) => a.latitude !== null && a.longitude !== null)
							.map((a) => (
								<div key={a.id}>
									<Marker
										position={[a.latitude, a.longitude]}
										icon={thisIcon}>
										<Popup
											companyId={a.company_id}
										>
											{a.number !== null ? a.number + " " : ""}
											{a.address_1 !== null ? a.address_1 : ""}
											<br/>
											{a.address_2 !== null ? a.address_2 : ""}
											{a.address_2 !== null ? <br/> : null}
											{a.postal_code !== null ? a.postal_code + " - " : ""}
											{a.city !== null ? a.city : ""}
											<br/>
											{a.country !== null ? a.country : ""}
											{a.country !== null ? <br/> : ""}
											{a.administrative_area !== null ? a.administrative_area : ""}
										</Popup>
									</Marker>
								</div>
							))
						: ""}
					<TileLayer
						attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
				</Map>
				{this.state.selectedCompanyId !== null
					? <div className="GlobalMap-company">
						<div>
                            Click to access the entity page:
						</div>
						<Company
							id={this.state.selectedCompanyId}
							name={this.state.selectedCompanyName}
						/>
					</div>
					: ""}
			</div>
		);
	}
}
