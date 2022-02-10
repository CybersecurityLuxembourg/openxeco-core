import React from "react";
import "./SingleMarkerMap.css";
import {
	Map, TileLayer, Marker,
} from "react-leaflet";

export default class SingleMarkerMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lat: props.lat,
			lon: props.lon,
			zoom: 15,
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.lat !== this.props.lat) this.setState({ lat: this.props.lat });
		if (prevProps.lon !== this.props.lon) this.setState({ lon: this.props.lon });
	}

	render() {
		return (
			<div>
				<Map
					center={[
						this.state.lat !== null ? this.state.lat : 49.8116,
						this.state.lon !== null ? this.state.lon : 6.1319,
					]}
					zoom={this.state.zoom}
					style={{ width: "100%", height: "300px" }}
				>
					{this.state.lat !== null && this.state.lon !== null
						? <Marker position={[this.state.lat, this.state.lon]}/>
						: ""}
					<TileLayer
						attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
				</Map>
			</div>
		);
	}
}
