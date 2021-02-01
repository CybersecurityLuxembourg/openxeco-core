import React from 'react';
import './PageMedia.css';
import Lock from "./box/Lock";
import Loading from "./box/Loading";
import Message from "./box/Message";
import Info from "./box/Info";
import Table from './table/Table';
import Image from './item/Image';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../utils/request';
import DialogAddImage from './dialog/DialogAddImage';


export default class PageMedia extends React.Component {

	constructor(props){
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			images: null
		}
	}

	componentDidMount(){
		this.refresh();
	}

	refresh() {
		this.setState({
			images: null
		});

		getRequest.call(this, "media/get_images", data => {
            this.setState({
                images: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

    changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		return (
			<div id="PageMedia" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Media</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogAddImage
		                        trigger={
		                            <button
		                                className={"blue-background"}
		                                data-hover="Filter">
		                                <span><i className="fas fa-plus"/></span>
		                            </button>
		                        }
		                        afterValidate={this.refresh}
		                    />
						</div>
					</div>
				</div>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						{this.state.images === null ?
							<Loading
								height={300}
							/>
						: this.state.images.length === 0 ?
							<Message
								text={"No media in the library"}
								height={300}
							/>
						: 
							<div className="row">
								{this.state.images.map(i => { return i }).reverse().map(i => { return (
									<div className="col-md-2 col-sm-3">
										<Image 
											id={i.id}
											thumbnail={i.thumbnail}
											height={i.height}
											width={i.width}
											creationDate={i.creation_date}
										/>
									</div>
								)})}
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}