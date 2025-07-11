import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FeeConfiguration, BusStop } from '../types';

export const configService = {
  async getFeeConfigurations(): Promise<FeeConfiguration[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('fee_configurations')
          .select('*')
          .order('class');

        if (error) {
          console.error('Error fetching fee configurations:', error);
          return [];
        }

        return data?.map(config => ({
          id: config.id,
          class: config.class,
          developmentFee: config.development_fee,
          updatedAt: new Date(config.updated_at),
        })) || [];
      } catch (error) {
        console.error('Error in getFeeConfigurations:', error);
        return [];
      }
    } else {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('school_fee_configurations') || '[]');
    }
  },

  async updateFeeConfiguration(classNumber: number, amount: number): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('fee_configurations')
          .update({
            development_fee: amount,
            updated_at: new Date().toISOString(),
          })
          .eq('class', classNumber);

        return !error;
      } catch (error) {
        console.error('Error updating fee configuration:', error);
        return false;
      }
    } else {
      // Fallback to localStorage
      const configs: FeeConfiguration[] = JSON.parse(localStorage.getItem('school_fee_configurations') || '[]');
      const updatedConfigs = configs.map(config => 
        config.class === classNumber 
          ? { ...config, developmentFee: amount, updatedAt: new Date() }
          : config
      );
      localStorage.setItem('school_fee_configurations', JSON.stringify(updatedConfigs));
      return true;
    }
  },

  async getBusStops(): Promise<BusStop[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('bus_stops')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching bus stops:', error);
          return [];
        }

        return data?.map(stop => ({
          id: stop.id,
          name: stop.name,
          amount: stop.amount,
          createdAt: new Date(stop.created_at),
        })) || [];
      } catch (error) {
        console.error('Error in getBusStops:', error);
        return [];
      }
    } else {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('school_bus_stops') || '[]');
    }
  },

  async addBusStop(name: string, amount: number): Promise<BusStop | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('bus_stops')
          .insert({ name, amount })
          .select()
          .single();

        if (error) {
          console.error('Error adding bus stop:', error);
          return null;
        }

        return {
          id: data.id,
          name: data.name,
          amount: data.amount,
          createdAt: new Date(data.created_at),
        };
      } catch (error) {
        console.error('Error in addBusStop:', error);
        return null;
      }
    } else {
      // Fallback to localStorage
      const newBusStop: BusStop = {
        id: `stop_${Date.now()}`,
        name,
        amount,
        createdAt: new Date(),
      };
      
      const busStops: BusStop[] = JSON.parse(localStorage.getItem('school_bus_stops') || '[]');
      busStops.push(newBusStop);
      localStorage.setItem('school_bus_stops', JSON.stringify(busStops));
      return newBusStop;
    }
  },

  async updateBusStop(id: string, name: string, amount: number): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('bus_stops')
          .update({ name, amount })
          .eq('id', id);

        return !error;
      } catch (error) {
        console.error('Error updating bus stop:', error);
        return false;
      }
    } else {
      // Fallback to localStorage
      const busStops: BusStop[] = JSON.parse(localStorage.getItem('school_bus_stops') || '[]');
      const updatedStops = busStops.map(stop => 
        stop.id === id ? { ...stop, name, amount } : stop
      );
      localStorage.setItem('school_bus_stops', JSON.stringify(updatedStops));
      return true;
    }
  },

  async deleteBusStop(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('bus_stops')
          .delete()
          .eq('id', id);

        return !error;
      } catch (error) {
        console.error('Error deleting bus stop:', error);
        return false;
      }
    } else {
      // Fallback to localStorage
      const busStops: BusStop[] = JSON.parse(localStorage.getItem('school_bus_stops') || '[]');
      const updatedStops = busStops.filter(stop => stop.id !== id);
      localStorage.setItem('school_bus_stops', JSON.stringify(updatedStops));
      return true;
    }
  }
};