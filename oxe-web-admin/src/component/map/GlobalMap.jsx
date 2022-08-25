import React from "react";
import "./GlobalMap.css";
import L from "leaflet";
import {
	Map, TileLayer, Marker, Popup,
} from "react-leaflet";
import { NotificationManager as nm } from "react-notifications";
import Entity from "../item/Entity.jsx";
import { getRequest } from "../../utils/request.jsx";

export default class GlobalMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lat: 49.8116,
			lng: 6.1319,
			zoom: 10,
			selectedEntityId: null,
			selectedEntityData: null,
		};
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.selectedEntityId !== this.state.selectedEntityId
            && this.state.selectedEntityId !== null) {
			getRequest.call(this, "entity/get_entity/" + this.state.selectedEntityId, (data) => {
				this.setState({
					selectedEntityData: data.name,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	handlePopupClose() {
		this.setState({ selectedEntityId: null, selectedEntityData: null });
	}

	handlePopupOpen(entityId) {
		this.setState({ selectedEntityId: entityId });
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
					onPopupOpen={(e) => this.handlePopupOpen(e.popup.options.entityId)}
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
											entityId={a.entity_id}
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
				{this.state.selectedEntityId !== null
					? <div className="GlobalMap-entity">
						<div>
                            Click to access the entity page:
						</div>
						<Entity
							id={this.state.selectedEntityId}
							name={this.state.selectedEntityData.name}
							legalStatus={this.state.selectedEntityData.legal_status}
						/>
					</div>
					: ""}
			</div>
		);
	}
}
