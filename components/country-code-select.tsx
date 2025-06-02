"use client"

import { Input } from "@/components/ui/input"

import * as React from "react"
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { countries } from "@/lib/country-data"
import { ScrollArea } from "./ui/scroll-area"

interface CountryCodeSelectProps {
  value: string // O dialCode selecionado, ex: "+351"
  onChange: (dialCode: string) => void
  disabled?: boolean
}

export function CountryCodeSelect({ value, onChange, disabled }: CountryCodeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const selectedCountry = countries.find((country) => country.dialCode === value)

  const filteredCountries = searchTerm
    ? countries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.dialCode.includes(searchTerm) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : countries

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[130px] justify-between text-sm"
          disabled={disabled}
        >
          {selectedCountry ? (
            <>
              <span className="mr-1">{selectedCountry.flagEmoji}</span>
              {selectedCountry.dialCode}
            </>
          ) : (
            "Prefixo"
          )}
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="p-2 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <ScrollArea className="h-[250px]">
            <CommandList>
              {filteredCountries.length === 0 && <CommandEmpty>Nenhum país encontrado.</CommandEmpty>}
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode} ${country.code}`} // Valor para pesquisa interna do Command
                    onSelect={() => {
                      onChange(country.dialCode)
                      setOpen(false)
                      setSearchTerm("")
                    }}
                    className="text-sm"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === country.dialCode ? "opacity-100" : "opacity-0")} />
                    <span className="mr-2">{country.flagEmoji}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="ml-2 text-muted-foreground">{country.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
