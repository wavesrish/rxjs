import 'materialize-css/dist/css/materialize.css';
import '../styles.css';
import 'materialize-css/dist/js/materialize.js'

import { fromEvent, from, Observable, of } from 'rxjs';
import { catchError, debounceTime, filter } from 'rxjs/operators';
import { map, switchMap } from 'rxjs/operators';
import { IReposResponce } from '../custom_types/IReposResponce';
import { IResponceMetaData } from '../custom_types/IResponceMetaData';

const searchInput: HTMLInputElement = document.querySelector("#search_text") as HTMLInputElement;
const foundedRepositoriesUl: HTMLUListElement = document.querySelector(".collection") as HTMLUListElement;

let typeInSearchInput$: Observable<string> = fromEvent(searchInput,'keyup')
    .pipe(
        map((event: any) => {
            return event.target.value as string;
        }));



typeInSearchInput$.pipe(
    debounceTime(500),
    filter((searchValue: string) => {
        return searchValue.length > 2
    }),
    switchMap((searchValue: string) => {
        return from(
            fetch(`https://api.github.com/search/repositories?q=${(searchValue).trim()}+in:name,description`)
                .then((result) => {
                    return result.json();
                })
                .catch((error) => {
                console.log(error);
            })
        )
    }),
    catchError((err: any) => {
        renderError( err);
        return {};
    })
    ).subscribe((response: IResponceMetaData) => {
        renderRepositoriesListName(
            response
        );
    });

const renderError = (error: String): void => {
    const errorContainer: HTMLDivElement = document.querySelector('.error') as HTMLDivElement;
    errorContainer.innerHTML = ` <p> ${error}</p>`;
};

const renderRepositoriesListName = (response: IResponceMetaData) => {
    foundedRepositoriesUl.innerHTML = '';
    if (response && !response.incomplete_results && response.items.length > 0) {
        const repos: Observable<IReposResponce[]> = of(response.items as IReposResponce[]);
        repos.pipe(map( (items)=> {
            return items.slice(0, 10)
        })).subscribe((items: IReposResponce[]) => {
            createLiElements(items);
        });
    }
};

const createLiElements = (items: IReposResponce[]) => {
    items.map((item: IReposResponce) => {
        const liHTMLElement: HTMLLIElement = document.createElement('li');
        liHTMLElement.className = 'collection-item';
        const divHTMLElement: HTMLDivElement = document.createElement('div');
        const link: HTMLAnchorElement = document.createElement('a');
        link.setAttribute('href', item.html_url);
        link.text = item.name;
        link.className = 'secondary-content';
        divHTMLElement.appendChild(link);
        liHTMLElement.appendChild(divHTMLElement);
        foundedRepositoriesUl.append(liHTMLElement);
    });
};