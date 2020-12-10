import keys from 'config/keys.json'
import GoogleMapReact from 'google-map-react'

const Marker = ({ text }) => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "auto", height: "auto", fontSize: "17px", color: "#333333" }}>
    <div style={{ backgroundColor: "rgba(66, 117, 245, 0.4)", height: '35px', width: "35px", borderRadius: "24px" }} />
</div>

export default (props) => {
    if (typeof(props.size) == "undefined") {
        props.size = "420px"
    }
    return <div style={{ height: props.size, width: props.size }}>
        <GoogleMapReact
            bootstrapURLKeys={{ key: keys.google_api_key }}
            defaultCenter={props.center}
            defaultZoom={props.zoom ?? 1}
        >
            <Marker
                lat={props.center.lat}
                lng={props.center.lng}
                text={props.markerText ?? "Here"}
            />
        </GoogleMapReact>
    </div>
}