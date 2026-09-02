package main

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"
)

type DataProviderFunc func(r *http.Request) map[string]any

type Page struct {
	Templates []string
	DataFunc  DataProviderFunc
}

func servePages() {
	registerPage("/", []string{"base.html", "index.html"}, []string{})
	registerPage("/prismanis", []string{"base.html", "prismanis.html"}, []string{"ts/prismanis/index.ts"})
	registerPage("/cards", []string{"base.html", "cards.html"}, []string{"ts/cards/index.ts"});
	registerPage("/toneguessr", []string{"base.html", "toneguessr.html"}, []string{"ts/toneguessr/index.ts"})
	registerPage("/grid", []string{"base.html", "grid.html"}, []string{"ts/grid/index.ts"})
	registerPage("/land", []string{"base.html", "land.html"}, []string{"ts/land/index.ts"})
	registerPage("/group", []string{"base.html", "group.html"}, []string{"ts/group/index.ts"})
	registerPage("/sdf", []string{"base.html", "sdf.html"}, []string{"ts/sdf/index.ts"})
}

func registerPage(path string, templateFiles []string, tsFiles []string) {
	config := GetConfig()

	http.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
		var fullPaths []string
		for _, file := range templateFiles {
			fullPaths = append(fullPaths, filepath.Join(config.WebRoot, "templates", file))
		}

		tmpl, err := template.ParseFiles(fullPaths...)
		if err != nil {
			http.Error(w, "Could not load templates: "+err.Error(), http.StatusInternalServerError)
			return
		}

		protocol := "http"
		if r.TLS != nil {
			protocol = "https"
		}

		data := map[string]any{
			"ViteHead": generateViteTags(append([]string{"ts/index.ts"}, tsFiles... )),
			"IsDev":    config.IsDev,
			"Page":     path,
			"Protocol": protocol,
			"Host":     r.Host,
		}

		err = tmpl.ExecuteTemplate(w, templateFiles[0], data)
		if err != nil {
			log.Printf("Template execution error: %v", err)
		}
	})
}
