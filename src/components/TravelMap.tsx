import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { WeatherEffect, WeatherType } from './WeatherEffect';
import { Cloud, CloudRain, Sun, Zap, Snowflake, X, Star } from 'lucide-react';
import { StackedGallery } from './StackedGallery';

const WeatherIcon = ({ condition }: { condition?: string }) => {
  if (!condition) return null;
  const c = condition.toLowerCase();
  if (c.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-400" />;
  if (c.includes('clouds')) return <Cloud className="w-5 h-5 text-white/60" />;
  if (c.includes('snow')) return <Snowflake className="w-5 h-5 text-white" />;
  if (c.includes('storm')) return <Zap className="w-5 h-5 text-amber-300" />;
  return <Sun className="w-5 h-5 text-amber-400" />;
};

import { INITIAL_CITIES } from '../constants';
import { CityData, WeatherData } from '../types';
import { cn } from '../lib/utils';

// Helper for star rating display
const StarRating = ({ rating, active = true }: { rating: number, active?: boolean }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = Math.min(Math.max(rating - (s - 1), 0), 1);
        return (
          <div key={s} className="relative">
            <Star className={cn("w-4 h-4", active ? "text-white/20" : "text-white/5")} />
            {fill > 0 && (
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="w-4 h-4 text-emerald-200 fill-emerald-200" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const TravelMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [topologyData, setTopologyData] = useState<any>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);

  const fetchWeather = async (city: string) => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      // Mock weather if no key
      const conditions: any = ['Clear', 'Clouds', 'Rain'];
      const random = conditions[Math.floor(Math.random() * conditions.length)];
      setCurrentWeather({
        temp: 22,
        condition: random,
        icon: '01d',
        type: random
      });
      return;
    }

    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
      const data = await res.json();
      if (data.weather) {
        setCurrentWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: data.weather[0].icon,
          type: data.weather[0].main
        });
      }
    } catch (e) {
      console.error("Weather fetch failed", e);
    }
  };

  useEffect(() => {
    if (selectedCity && selectedCity.type === 'resident') {
      fetchWeather(selectedCity.englishName);
    } else {
      setCurrentWeather(null);
    }
  }, [selectedCity]);

  // Load map data
  useEffect(() => {
    let isMounted = true;
    fetch('/china-cities.json')
      .then(res => {
        if (!res.ok) throw new Error('Map file not found');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        
        let features: any[] = [];
        
        if (data.type === 'Topology') {
          setTopologyData(data);
          // Handle TopoJSON
          const objectName = Object.keys(data.objects)[0];
          if (objectName) {
            const geojson: any = topojson.feature(data, data.objects[objectName]);
            features = geojson.features || [];
          }
        } else {
          // Handle GeoJSON
          features = Array.isArray(data) ? data : (data.features || []);
        }

        const geojson = { type: 'FeatureCollection', features };
        
        // Pre-match city info for performance
        features.forEach((f: any) => {
          const cityName = f.properties.NL_NAME_2 || f.properties.NAME_2 || f.properties.name || "";
          f.matchedCityInfo = INITIAL_CITIES.find(c => cityName.includes(c.name) || c.name.includes(cityName));
        });

        setMapData(geojson);
      })
      .catch(err => {
        console.error("Map load error:", err);
      });
    return () => { isMounted = false; };
  }, []);

  const drawMap = React.useCallback(() => {
    if (!mapData || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const projection = d3.geoMercator()
      .center([105, 38])
      .scale(width > 1200 ? 1000 : 800)
      .translate([width / 2, height / 2]);
    
    const path = d3.geoPath().projection(projection);
    const geoData = mapData;

    svg.selectAll('*').remove();
    
    const defs = svg.append('defs');
    
    // Smooth External Shadow
    const mapFilter = defs.append('filter')
      .attr('id', 'map-shadow-glow')
      .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    mapFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '6')
      .attr('result', 'blur');
    mapFilter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', '0').attr('dy', '10')
      .attr('result', 'offsetBlur');
    mapFilter.append('feFlood')
      .attr('flood-color', 'rgba(255,255,255,0.8)')
      .attr('result', 'glowColor');
    mapFilter.append('feComposite')
      .attr('in', 'glowColor').attr('in2', 'blur').attr('operator', 'in')
      .attr('result', 'glow');
    const feMerge = mapFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'offsetBlur');
    feMerge.append('feMergeNode').attr('in', 'glow');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('class', 'map-stage');

    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .on('zoom', (event) => {
        if (event.transform) {
          g.attr('transform', event.transform.toString());
          // Keep markers at a constant visual size
          g.selectAll('.resident-marker')
            .style('font-size', `${20 / event.transform.k}px`)
            .attr('dy', `${-12 / event.transform.k}`);
        }
      });

    svg.call(zoom as any);
    
    // Store zoom behavior for external use
    (svg as any)._zoom = zoom;
    (svg as any)._width = width;
    (svg as any)._height = height;

    // Draw Layers
    const citiesGroup = g.append('g').attr('class', 'cities-layer');
    citiesGroup.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('class', (d: any) => {
        const cityInfo = d.matchedCityInfo;
        return cn(
          "map-path-base cursor-pointer fill-white/[0.04] stroke-white/[0.08] outline-none stroke-[0.8px]", // 添加基础类
          cityInfo?.type === 'unlocked' && "fill-white/50 stroke-white/80",
          cityInfo?.type === 'resident' && "fill-emerald-200/50 stroke-emerald-200/80",
          cityInfo?.type === 'wishlist' && "fill-sky-200/50 stroke-sky-200/80"
        );
      })
      .style('vector-effect', 'non-scaling-stroke')
      .on('mouseenter', function(event, d: any) {
        d3.select(this).raise();
        // 仅仅通过添加 class 来改变外观
        d3.select(this).classed('map-path-hover', true);
        
        setHoverCity(d.properties.NL_NAME_2 || d.properties.NAME_2 || d.properties.name);
      })
      .on('mouseleave', function(event, d: any) {
        // 移除 class，样式会自动根据 map-path-base 的 transition 丝滑回退
        d3.select(this).classed('map-path-hover', false);
        
        setHoverCity(null);
      })

      .on('click', function(event, d: any) {
        const cityName = d.properties.NL_NAME_2 || d.properties.NAME_2 || d.properties.name || "";
        const cityInfo = d.matchedCityInfo || {
          name: cityName,
          englishName: d.properties.NAME_2 || cityName,
          province: d.properties.NL_NAME_1 || 'Unknown',
          country: '中国',
          type: 'wishlist',
        };
        
        const centroid = path.centroid(d);
        if (!centroid || isNaN(centroid[0])) return;
        const [x, y] = centroid;
        
        event.stopPropagation();
        
        svg.transition().duration(1000)
          .ease(d3.easeExpInOut)
          .call(
            zoom.transform,
            d3.zoomIdentity
              .translate(width * 0.35, height * 0.5) // Shift left to make room for panel
              .scale(2.5) // Moderate zoom, not too tight
              .translate(-x, -y)
          );
        setSelectedCity(cityInfo as CityData);
      });

    // Layer 2: Provincial Borders (Mesh for efficiency and differentiation)
    if (topologyData) {
      const objectName = Object.keys(topologyData.objects)[0];
      const provinceMesh = topojson.mesh(topologyData, topologyData.objects[objectName], (a, b) => 
        a !== b && (a.properties.GID_1 !== b.properties.GID_1 || a.properties.NAME_1 !== b.properties.NAME_1)
      );

      g.append('path')
        .datum(provinceMesh)
        .attr('d', path as any)
        .attr('class', 'fill-none stroke-white/20 stroke-[2px] pointer-events-none')
        .style('vector-effect', 'non-scaling-stroke');
      
      // National Boundary
      const countryMesh = topojson.mesh(topologyData, topologyData.objects[objectName], (a, b) => a === b);
      g.append('path')
        .datum(countryMesh)
        .attr('d', path as any)
        .attr('class', 'fill-none stroke-white/50 stroke-[2px] pointer-events-none')
        .style('vector-effect', 'non-scaling-stroke')
        .style('filter', 'url(#map-shadow-glow)');
    } else {
      // Fallback for GeoJSON or when topology fails
      const provinceEntries = d3.groups(geoData.features, (d: any) => d.properties.GID_1);
      const provincesGroup = g.append('g').attr('class', 'provinces-layer pointer-events-none');
      
      provincesGroup.selectAll('path')
        .data(provinceEntries)
        .enter()
        .append('path')
        .attr('d', (d: any) => {
          return path({ type: 'FeatureCollection', features: d[1] } as any);
        })
        .attr('class', 'fill-none stroke-white/10 stroke-[0.5px]')
        .style('vector-effect', 'non-scaling-stroke');

      // National Boundary with Glow and Shadow
      g.append('path')
        .datum(mapData)
        .attr('d', path as any)
        .attr('class', 'fill-none stroke-white/40 stroke-[px] pointer-events-none')
        .style('vector-effect', 'non-scaling-stroke')
        .style('filter', 'url(#map-shadow-glow)');
    }

    // Resident Markers
    const markersGroup = g.append('g').attr('class', 'resident-markers');
    const residentFeatures = geoData.features.filter((d: any) => d.matchedCityInfo?.type === 'resident');

    markersGroup.selectAll('g')
      .data(residentFeatures)
      .enter()
      .append('g')
      .attr('transform', (d: any) => {
        const centroid = path.centroid(d);
        if (!centroid || isNaN(centroid[0])) return 'translate(0,0)';
        return `translate(${centroid[0]},${centroid[1]})`;
      })
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'resident-marker pointer-events-none select-none drop-shadow-[0_8px_12px_rgba(0,0,0,1)]')
      .style('font-size', '20px')
      .attr('dy', '-12')
      .text('📍');

    // Initial position
    svg.call(zoom.transform as any, d3.zoomIdentity);
  }, [mapData]);

  useEffect(() => {
    drawMap();
    window.addEventListener('resize', drawMap);
    return () => window.removeEventListener('resize', drawMap);
  }, [drawMap]);

  useEffect(() => {
    if (!selectedCity && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const zoom = (svg as any)._zoom;
      if (zoom) {
        svg.transition().duration(800)
          .ease(d3.easeExpInOut)
          .call(zoom.transform, d3.zoomIdentity);
      }
    }
  }, [selectedCity]);

  const handleMapClick = () => {
    setSelectedCity(null);
  };

  return (
    <div ref={containerRef} className="w-full h-screen relative overflow-hidden" onClick={handleMapClick}>
      {!mapData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="glass-card p-10 text-center max-w-md">
            <p className="text-2xl font-display mb-6 tracking-widest uppercase">Waiting for the Universe</p>
            <div className="animate-pulse w-full h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="bg-white/40 h-full w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full" />

      {/* Weather Background Effect */}
      {selectedCity?.type === 'resident' && currentWeather && (
        <div className="absolute inset-0 pointer-events-none">
          <WeatherEffect type={currentWeather.type as any} />
        </div>
      )}

      {/* City Detail Panel */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute top-24 right-12 w-96 glass-card p-10 pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedCity(null)} className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity p-2">
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 relative">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-display leading-tight">{selectedCity.name}</h2>
                    {selectedCity.type === 'resident' && <span className="text-xl">📍</span>}
                  </div>
                  {selectedCity.type === 'resident' && selectedCity.residentEmoji && (
                    <p className="text-[10px] text-emerald-200 font-mono tracking-widest uppercase">
                      {selectedCity.residentEmoji}的现居地
                    </p>
                  )}
                </div>
                {selectedCity.type === 'resident' && currentWeather && (
                  <div className="flex flex-col items-end glass px-3 py-2 rounded-xl border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                      <WeatherIcon condition={currentWeather.type} />
                      <span className="text-xl font-display">{currentWeather.temp}°</span>
                    </div>
                    <span className="text-[10px] opacity-40 uppercase font-mono tracking-tighter">{currentWeather.condition}</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-mono uppercase opacity-60 tracking-[0.2em] mt-2">
                {selectedCity.englishName} • {selectedCity.province}
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] opacity-60 uppercase font-mono tracking-widest">Experience</span>
                <StarRating rating={selectedCity.rating || 0} active={!!selectedCity.rating} />
              </div>

              {/* --- 插入开始 --- */}
              {(selectedCity.type === 'resident' || selectedCity.type === 'unlocked') && (
                <StackedGallery 
                  cityName={selectedCity.name} 
                  imageCount={6} // 或者是你数据里定义的图片数量
                />
              )}
              {/* --- 插入结束 --- */}

              {selectedCity.type === 'unlocked' && (
                <div className="pt-5 border-t border-white/5">
                  <p className="text-[10px] uppercase opacity-40 font-mono tracking-widest">解锁时间</p>
                  <p className="text-lg font-display mt-1">{selectedCity.unlockDate}</p>
                </div>
              )}

              {selectedCity.wantsToGo && (
                <div className="pt-5 border-t border-white/5">
                  <p className="text-[10px] uppercase opacity-80 font-mono italic tracking-widest text-sky-300/80">
                    {selectedCity.wantsToGo.join(' & ')} 想去
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoverCity && !selectedCity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none px-6 py-2 glass rounded-full shadow-2xl"
          >
             <p className="text-sm font-display tracking-[0.3em] uppercase text-white/40 italic">{hoverCity}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
