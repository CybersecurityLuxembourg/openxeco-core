import React, { Component } from 'react';
import './LogArticleVersion.css';
import Popup from "reactjs-popup";
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import FormLine from '../button/FormLine';
import Loading from '../box/Loading';
import DialogConfirmation from '../dialog/DialogConfirmation';
import Message from "../box/Message";
import { getApiURL } from '../../utils/env';


export default class LogArticleVersion extends Component {

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onOpen = this.onOpen.bind(this);

        this.state = {
        }
    }

    onClick() {
        if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
            this.onOpen();

            let newState = !this.props.selected;
            if (typeof this.props.onClick !== "undefined")
                this.props.onClick(this.props.id, newState);
        }
    };

    onClose() {
        this.setState({ isDetailOpened: false });
    }

    onOpen() {
        this.setState({ isDetailOpened: true });
    }

    render() {
        return (
            <Popup
                className="Popup-small-size"
                trigger={
                    <div className={"LogArticleVersion"}>
                        <i className="fas fa-history"/>
                        <div className={"LogArticleVersion-name"}>
                            {this.props.log !== undefined && this.props.log !== null ?
                                "Log " + this.props.log.sys_date 
                                : 
                                "Unfound log"
                            }
                        </div>
                    </div>
                }
                modal
                closeOnDocumentClick
                onClose={this.onClose}
                onOpen={this.onOpen}
            >
                <div className="row">
                    <div className="col-md-12">
                        <h2>
                            {this.props.log !== undefined && this.props.log !== null ?
                                "Log " + this.props.log.sys_date 
                                : 
                                "Unfound log"
                            }
                        </h2>
                    </div>
                    <div className="col-md-6">
                        <h3>Previous version</h3>
                        {this.props.previousLog !== undefined && this.props.previousLog !== null ?
                            <div>
                                <FormLine
                                    fullWidth={true}
                                    label={"Time"}
                                    value={this.props.previousLog.sys_date}
                                    disabled={true}
                                />
                                <FormLine
                                    fullWidth={true}
                                    label={"User"}
                                    value={this.props.previousLog.user_id}
                                    disabled={true}
                                />
                                {JSON.parse(this.props.previousLog.params).content.map((item, index) => {
                                    return (
                                        <div>
                                            {item.type === "TITLE1" ?
                                                <h4>{item.content}</h4>
                                            : ""}
                                            {item.type === "TITLE2" ?
                                                <h5>{item.content}</h5>
                                            : ""}
                                            {item.type === "TITLE3" ?
                                                <h6>{item.content}</h6>
                                            : ""}
                                            {item.type === "PARAGRAPH" ?
                                                <div>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: item.content
                                                        }}>
                                                    </div>
                                                </div>
                                            : ""}
                                            {item.type === "IMAGE" ?
                                                <div>
                                                    <img 
                                                        className={"LogArticleVersion-image"}
                                                        src={getApiURL() + "public/get_image/" + item.content}
                                                    />
                                                </div>
                                            : ""}
                                        </div>
                                    )
                                })}
                            </div>
                            : 
                            <Message 
                                height={180}
                                text={"No previous log"}
                            />
                        }
                    </div>
                    <div className="col-md-6">
                        <h3>Current version</h3>
                        {this.props.log !== undefined && this.props.log !== null ?
                            <div>
                                <FormLine
                                    fullWidth={true}
                                    label={"Time"}
                                    value={this.props.log.sys_date}
                                    disabled={true}
                                />
                                <FormLine
                                    fullWidth={true}
                                    label={"User"}
                                    value={this.props.log.user_id}
                                    disabled={true}
                                />
                                {JSON.parse(this.props.log.params).content.map((item, index) => {
                                    return (
                                        <div>
                                            {item.type === "TITLE1" ?
                                                <h4>{item.content}</h4>
                                            : ""}
                                            {item.type === "TITLE2" ?
                                                <h5>{item.content}</h5>
                                            : ""}
                                            {item.type === "TITLE3" ?
                                                <h6>{item.content}</h6>
                                            : ""}
                                            {item.type === "PARAGRAPH" ?
                                                <div>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: item.content
                                                        }}>
                                                    </div>
                                                </div>
                                            : ""}
                                            {item.type === "IMAGE" ?
                                                <div>
                                                    <img 
                                                        className={"LogArticleVersion-image"}
                                                        src={getApiURL() + "public/get_image/" + item.content}
                                                    />
                                                </div>
                                            : ""}
                                        </div>
                                    )
                                })}
                            </div>
                            : 
                            <Message 
                                height={180}
                                text={"Unfound log"}
                            />
                        }
                    </div>
                </div>
            </Popup>
        );
    }
}