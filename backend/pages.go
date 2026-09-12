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

	registerPageSimple("prismanis")
	registerPageSimple("cards")
	registerPageSimple("toneguessr")
	registerPageSimple("grid")
	registerPageSimple("land")
	registerPageSimple("group")
	registerPageSimple("sdf")
}

func registerPageSimple(name string) {
	registerPage("/" + name, []string{"base.html", name + ".html"}, []string{"ts/" + name + "/index.ts"})
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
