/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { forwardRef, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  View
} from "react-native";
import MapView, { Geojson, Marker } from "react-native-maps";
// Corrigidos os caminhos de importação para usar caminhos relativos
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Highlight } from "@/types/Cities";
import { mapStyleDark } from "./mapStyleDark";


interface MunicipioMapProps {
  highlights: Highlight[];
  initialLatitude: number;
  initialLongitude: number;
  ibgeCode?: string; // IBGE code for fetching GeoJSON
}

// IMPORTANTE: Para usar o PROVIDER_GOOGLE no Android e iOS,
// você precisa configurar as chaves da API do Google Maps
// nos seus arquivos nativos (AndroidManifest.xml e AppDelegate.m).
// Consulte a documentação do react-native-maps.

const MunicipioMap = forwardRef<MapView, MunicipioMapProps>(
  ({ highlights, initialLatitude, initialLongitude, ibgeCode }, ref) => {
    const colorScheme = useColorScheme();
    const [geojson, setGeojson] = useState<object | null>(null);

    useEffect(() => {
      if (!ibgeCode) {
        setGeojson(null);
        return;
      }

      const loadGeoJson = async () => {
        try {
          const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${ibgeCode}?formato=application/vnd.geo+json`
          );
          if (!response.ok) {
            throw new Error("GeoJSON não encontrado para este município.");
          }
          const data = await response.json();
          setGeojson(data);
        } catch (err) {
          console.error("Erro ao carregar GeoJSON do IBGE:", err);
          setGeojson(null);
        }
      };

      loadGeoJson();
    }, [ibgeCode]);

    const handleGetDirections = (
      latitude: number,
      longitude: number,
      name: string
    ) => {
      const scheme = Platform.select({
        ios: "maps:0,0?q=",
        android: "geo:0,0?q=",
      });
      const latLng = `${latitude},${longitude}`;
      const label = name;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });

      Linking.openURL(url!);
    };

    const initialRegion = {
      latitude: initialLatitude,
      longitude: initialLongitude,
      latitudeDelta: 0.2, // Zoom level
      longitudeDelta: 0.2,
    };

    return (
      <View style={styles.container}>
        <MapView
          mapType="satellite"
          ref={ref}
          style={StyleSheet.absoluteFillObject}
          initialRegion={initialRegion}
          customMapStyle={colorScheme === "dark" ? mapStyleDark : []}
        >
          {geojson && (
            <Geojson
              // A tipagem do react-native-maps para GeoJSON pode ser estrita
              // e às vezes não corresponde perfeitamente à estrutura de dados
              // retornada por algumas APIs. O @ts-ignore é uma solução
              // temporária se o GeoJSON estiver renderizando corretamente.
              // @ts-ignore
              geojson={geojson}
              strokeColor="#007AFF"
              fillColor="rgba(0, 122, 255, 0.1)"
              strokeWidth={2}
            />
          )}

          {highlights.map((highlight) => (
            <Marker
              key={highlight.id}
              coordinate={{
                latitude: highlight.latitude,
                longitude: highlight.longitude,
              }}
              title={highlight.title}
              description={highlight.description}
            />
          ))}
        </MapView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
});

MunicipioMap.displayName = "MunicipioMap";

export default MunicipioMap;
